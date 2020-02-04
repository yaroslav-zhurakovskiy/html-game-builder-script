class PluginFileInput
    def initialize(params)
        @GADAdUnitID = params[:GADAdUnitID]
        @MintegralVideoAdUnitID = params[:MintegralVideoAdUnitID]
    end

    def get_binding
        return binding()
    end
end
