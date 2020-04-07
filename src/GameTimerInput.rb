class GameTimerInput
    def initialize(params)
        if params.key?(:GameTimer)
            ads_timer = params[:GameTimer]

            @request=ads_timer["request"]
            @interval=ads_timer["interval"]
        end
    end

    def get_binding
        binding
    end
end
