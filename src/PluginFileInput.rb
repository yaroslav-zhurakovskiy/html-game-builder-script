class PluginFileInput
    def initialize(params)
        @GADAdUnitID=params[:GADAdUnitID]
    end

    def get_binding
        return binding()
    end
end
