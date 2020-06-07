class PluginFileInput
    def initialize(params)
        @GADInterstitialAdUnitID = params[:GADInterstitialAdUnitID]
        @GADBannerAdUnitID = params[:GADBannerAdUnitID]
        @GADBannerPlacement = params[:GADBannerPlacement]
        @GADRewardedAdUnitID = params[:GADRewardedAdUnitID]

        @MintegralVideoAdUnitID = params[:MintegralVideoAdUnitID]
        @MintegralInterstitialAdUnitID = params[:MintegralInterstitialAdUnitID]
        @MintegralBannerAdUnitID = params[:MintegralBannerAdUnitID]
        @MintegralBannerSize = params[:MintegralBannerSize]
        @MintegralBannerPlacement = params[:MintegralBannerPlacement]

        @BytedanceBannerAdUnitID = params[:BytedanceBannerAdUnitID]
        @BytedanceBannerSize = params[:BytedanceBannerSize]
        @BytedanceBannerPlacement = params[:BytedanceBannerPlacement]
        @BytedanceVideoAdUnitID = params[:BytedanceVideoAdUnitID]
        @BytedanceRewardedVideoAdUnitID = params[:BytedanceRewardedVideoAdUnitID]

        @BytedanceInterstitialAdUnitID = params[:BytedanceInterstitialAdUnitID]
        @BytedanceInterstitialAdSize = params[:BytedanceInterstitialAdSize]

        @BytedanceSplashAdUnitID = params[:BytedanceSplashAdUnitID]
        @BytedanceSplashAdSize = params[:BytedanceSplashAdSize]
        @BytedanceSplashAdTolerateTimeout = params[:BytedanceSplashAdTolerateTimeout]

        @MintegralSplashAdUnitID = params[:MintegralSplashAdUnitID]
        @MintegralSplashAdCountdown = params[:MintegralSplashAdCountdown]
        @MintegralSplashAdAllowSkip = params[:MintegralSplashAdAllowSkip]
    end

    def get_binding
        return binding()
    end
end
