class BuildParamsLoader
    def load(input_provider)
        file_name = input_provider.get_coniguration_file_name
        check_yml_file_presence(file_name)

        begin
            file = File.open(file_name)
            yaml_file_content = YAML::load(file)
            params = yaml_file_content.inject({}){|memo,(k,v)| memo[k.to_sym] = v; memo}
            params
        rescue Exception => exception
            puts "#{file_name} parsing failed:"
            puts exception
            exit(-1)
        end
    end

    private def check_yml_file_presence(file_name)
        if !File.exist?(file_name)
          puts "Configuration file #{file_name} was not found!"
          exit(-1)
        end
    end
end
