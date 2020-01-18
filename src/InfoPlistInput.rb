class InfoPlistInput
    def initialize(params)
        @GADApplicationIdentifier=params[:GADApplicationIdentifier]
    end

    def get_binding
        return binding()
    end
end
