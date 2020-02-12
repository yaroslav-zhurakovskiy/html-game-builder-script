class PluginFileInput
    def initialize(params)
        @GADInterstitialAdUnitID = params[:GADInterstitialAdUnitID]
        @GADBannerAdUnitID = params[:GADBannerAdUnitID]
        @GADRewardedAdUnitID = params[:GADRewardedAdUnitID]

        @MintegralVideoAdUnitID = params[:MintegralVideoAdUnitID]
        @MintegralInterstitialAdUnitID = params[:MintegralInterstitialAdUnitID]
        @MintegralBannerAdUnitID = params[:MintegralBannerAdUnitID]
        @MintegralBannerSize = params[:MintegralBannerSize]
    end

    def get_binding
        return binding()
    end
end
