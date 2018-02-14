cc.Class({
    extends: cc.Component,
    properties: {
        manifestVersion: cc.RawAsset,
        manifestProject: cc.RawAsset,
    },

    checkCb: function (event) {
        cc.log('Code: ' + event.getEventCode());
        var enumTag = 0;
        switch (event.getEventCode())
        {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this._labelInfo.string = "No local manifest file found, hot update skipped.";
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this._labelInfo.string = "Fail to download manifest file, hot update skipped.";
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this._labelInfo.string = "Already up to date with the latest remote version.";
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                this._labelInfo.string = 'New version found, please try to update.';
                enumTag = 1;
                break;
            default:
                this._labelInfo.string = 'other case.'+event.getEventCode();
				enumTag = 2;
                break;
        }

        if(enumTag==1 || enumTag==0){
            cc.eventManager.removeListener(this._checkListener);
            this._checkListener = null;
        }
        if(enumTag==1){
            this.doUpdate();
        }else if(enumTag==0){
            this.enterGame();
        }
    },


    updateCb: function (event) {
        var needRestart = false;
        var bEnter = false;
        switch (event.getEventCode())
        {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this._labelInfo.string = 'No local manifest file found, hot update skipped.';
                bEnter = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                this._progressByte.progress = event.getPercent();
                this._progressFile.progress = event.getPercentByFile();
                this._labelFile.string = event.getDownloadedFiles() + ' / ' + event.getTotalFiles();
                this._labelByte.string = event.getDownloadedBytes() + ' / ' + event.getTotalBytes();

                var msg = event.getMessage();
                if (msg) {
                    this._labelInfo.string = 'Updated file: ' + msg;
                    // cc.log(event.getPercent()/100 + '% : ' + msg);
                }
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this._labelInfo.string = 'Fail to download manifest file, hot update skipped.';
                bEnter = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this._labelInfo.string = 'Already up to date with the latest remote version.';
                bEnter = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                this._labelInfo.string = 'Update finished. ' + event.getMessage();
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                this._labelInfo.string = 'Update failed. ' + event.getMessage();
                bEnter = true;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                this._labelInfo.string = 'Asset update error: ' + event.getAssetId() + ', ' + event.getMessage();
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                this._labelInfo.string = event.getMessage();
                break;
            default:
                this._labelInfo.string = 'default. ' + event.getMessage();
                break;
        }


        if (needRestart) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
            // Prepend the manifest's search path
            var searchPaths = jsb.fileUtils.getSearchPaths();
            var newPaths = this._am.getLocalManifest().getSearchPaths();
            console.log(JSON.stringify(newPaths));
            Array.prototype.unshift(searchPaths, newPaths);
            // This value will be retrieved and appended to the default search path during game startup,
            // please refer to samples/js-tests/main.js for detailed usage.
            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);

            cc.audioEngine.stopAll();
            cc.game.restart();
        }else if(bEnter){
            this.enterGame();
        }
    },
    
    checkUpdate: function () {
        this.node.runAction(cc.sequence(cc.delayTime(0.1),cc.callFunc(function(){
            if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
                this._am.loadLocalManifest(this.manifestProject);
            }
            if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
                this._labelInfo.string = 'Failed to load local manifest ...';
                this.enterGame();
                return;
            }
            this._checkListener = new jsb.EventListenerAssetsManager(this._am, this.checkCb.bind(this));
            cc.eventManager.addListener(this._checkListener, 1);

            this._am.checkUpdate();
        }.bind(this))));
    },

    doUpdate: function () {
        this.node.runAction(cc.sequence(cc.delayTime(0.1),cc.callFunc(function(){
            if (this._am) {
                this._updateListener = new jsb.EventListenerAssetsManager(this._am, this.updateCb.bind(this));
                cc.eventManager.addListener(this._updateListener, 1);

                if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
                    this._am.loadLocalManifest(this.manifestProject);
                }

                this._am.update();
            }
        }.bind(this))));
    },

    enterGame:function () {
        this.node.runAction(cc.sequence(cc.delayTime(0.1),cc.callFunc(function(){
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
            cc.director.loadScene('ServerListScene');
        }.bind(this))));
    },

    // use this for initialization
    onLoad: function () {
        // Hot update is only available in Native build
        if (!cc.sys.isNative) {
            this.enterGame();
            return;
        }
        this._labelInfo = cc.find('Canvas/update_panel/labelInfo').getComponent(cc.Label);
        this._progressFile = cc.find('Canvas/update_panel/progressFile').getComponent(cc.ProgressBar);
        this._labelFile = cc.find('Canvas/update_panel/labelFile').getComponent(cc.Label);
        this._progressByte = cc.find('Canvas/update_panel/progressByte').getComponent(cc.ProgressBar);
        this._labelByte = cc.find('Canvas/update_panel/labelByte').getComponent(cc.Label);

        this._storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'blackjack-remote-asset');
        cc.log('Storage path for remote asset : ' + this._storagePath);

        // Setup your own version compare handler, versionA and B is versions in string
        // if the return value greater than 0, versionA is greater than B,
        // if the return value equals 0, versionA equals to B,
        // if the return value smaller than 0, versionA is smaller than B.
        this.versionCompareHandle = function (versionA, versionB) {
            cc.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
            var vA = versionA.split('.');
            var vB = versionB.split('.');
            for (var i = 0; i < vA.length; ++i) {
                var a = parseInt(vA[i]);
                var b = parseInt(vB[i] || 0);
                if (a === b) {
                    continue;
                }
                else {
                    return a - b;
                }
            }
            if (vB.length > vA.length) {
                return -1;
            }
            else {
                return 0;
            }
        };

        // Init with empty manifest url for testing custom manifest
        this._am = new jsb.AssetsManager('', this._storagePath, this.versionCompareHandle);
        if (!cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._am.retain();
        }


        // Setup the verification callback, but we don't have md5 check function yet, so only print some message
        // Return true if the verification passed, otherwise return false
        this._am.setVerifyCallback(function (path, asset) {
            // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
            var compressed = asset.compressed;
            // Retrieve the correct md5 value.
            var expectedMD5 = asset.md5;
            // asset.path is relative path and path is absolute.
            var relativePath = asset.path;
            // The size of asset file, but this value could be absent.
            var size = asset.size;
            if (compressed) {
                this._labelInfo.string = "Verification passed : " + relativePath;
                return true;
            }
            else {
                this._labelInfo.string = "Verification passed : " + relativePath + ' (' + expectedMD5 + ')';
                return true;
            }
        }.bind(this));

        this._labelInfo.string = 'Hot update is ready, please check or directly update.';

        if (cc.sys.os === cc.sys.OS_ANDROID) {
            this._am.setMaxConcurrentTask(2);
        }else if (cc.sys.os === cc.sys.OS_IOS){
            this._am.setMaxConcurrentTask(10);
        }
        this.checkUpdate();
    },

    onDestroy: function () {
        if (this._updateListener) {
            cc.eventManager.removeListener(this._updateListener);
            this._updateListener = null;
        }
        if (this._am && !cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._am.release();
        }
    }
});
