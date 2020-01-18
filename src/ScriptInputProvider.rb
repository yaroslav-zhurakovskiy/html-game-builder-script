class ScriptInputProvider
    def initialize(parser)
        @parser = parser
        @arguments = @parser.parse(ARGV)
    end

    def get_coniguration_file_name
        if @arguments.key?(:config)
            @arguments[:config]
        else
            'Game.yml'
        end
    end

    def get_action
        if @arguments.key?(:action)
            @arguments[:action]
        else
            :generate
        end
    end
end
