class PofileInput
    def initialize(params)
        @ios_sdk_version = params[:sdk]
        @target_name = params[:name]
    end

    def get_binding
        return binding()
    end
end
