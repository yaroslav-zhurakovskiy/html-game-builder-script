class ScriptInputProvider
    def initialize(parser)
        @parser = parser
        @arguments = @parser.parse(ARGV)
    end

    def get_coniguration_file_name
        input_file_name = @arguments[:config]
        if input_file_name.nil?
          input_file_name = 'Game.yml'
        end
        input_file_name
    end

    def action

        if @arguments.key?(:action)
            @arguments[:action]
        else
            :generate
        end
    end
end
