class ERBCompiler
    def compile(params)
        erb_file_path = params[:erb_file_path]
        result_file_path = params[:result_file_path]
        input = params[:input]
        
        template_text = File.read(erb_file_path)
        template_binding = input.get_binding()
        result = ERB.new(template_text).result(template_binding)
        
        File.write(result_file_path, result)
        File.delete(erb_file_path)
    end
end
