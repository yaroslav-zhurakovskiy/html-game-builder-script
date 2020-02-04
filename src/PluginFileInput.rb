class PluginFileInput
    def initialize(params)
        @GADAdUnitID = params[:GADAdUnitID]
        @MintegralVideoAdUnitID = params[:MintegralVideoAdUnitID]
        @MintegralBannerAdUnitID = params[:MintegralBannerAdUnitID]
        @MintegralBannerSize = params[:MintegralBannerSize]
    end

    def get_binding
        return binding()
    end
end
