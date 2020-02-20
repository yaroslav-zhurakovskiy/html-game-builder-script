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
    end

    def get_binding
        return binding()
    end
end
