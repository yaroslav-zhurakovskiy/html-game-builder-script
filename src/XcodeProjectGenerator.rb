class XcodeProjectGenerator
    def regenerate(params)
        clean(params)
        generate(params)
    end

    def clean(params) 
        xcodeProjectOutDir = get_xcode_project_out_dir(params)
        system("rm -fr #{xcodeProjectOutDir}")
    end

    def generate(params)  
        out_dir = get_xcode_project_out_dir(params)
        templatePath = params[:templatePath]

        copy_tempalte(templatePath, out_dir)  
        copy_game(params[:gameSrc], templatePath, out_dir)
        copy_icon(params)
        copy_launch_image(params)
        compie_info_plist(params)
        compile_app_delegate(params)
        compile_podfile(params)
        generate_xcode_project(params)
        install_pods(out_dir)
    end

    def compile_app_delegate(params)
        compiler = ERBCompiler.new()
        compiler.compile(
        erb_file_path: target_file_path(params, 'AppDelegate.erb'),
        result_file_path: target_file_path(params, 'AppDelegate.swift'),
        input: AppDelegateInput.new(params)
        )
    end

    def target_file_path(params, file)
        out_dir = params[:xcodeProjectDir]
        File.expand_path("Game/#{file}", out_dir)
    end


    private def compie_info_plist(params)
        compiler = ERBCompiler.new()
        compiler.compile(
        erb_file_path: target_file_path(params, 'Info.erb'),
        result_file_path: target_file_path(params, 'Info.plist'),
        input: InfoPlistInput.new(params)
        )
    end

    private def copy_launch_image(params)
        if params.key?(:launchImageSrc)
            xcassets_path = target_file_path(params, 'Assets.xcassets')
            FileUtils.cp_r(params[:launchImageSrc], xcassets_path)
        end
    end

    private def copy_icon(params)
        if params.key?(:appiconsetSrc)
        xcassets_path = target_file_path(params, 'Assets.xcassets')
        FileUtils.cp_r(params[:appiconsetSrc], xcassets_path)
        end
    end

    private def install_pods(xcodeProjectOutDir)
        Dir.chdir(xcodeProjectOutDir) do
        system("pod install")
        end
    end

    private def copy_tempalte(templatePath, out_path)
        if !templatePath.nil?
        FileUtils.cp_r(templatePath, out_path)
        end
    end

    private def copy_game(game_src, templatePath, out_path)
        if !templatePath.nil?
        FileUtils.cp_r(game_src, out_path)
        end
    end

    private def generate_xcode_project(params)
        xcodeProjectOutDir = get_xcode_project_out_dir(params)
        text = generate_xcodgen_file_content(params)
        xcodegenProjectFileName = "project.yml"
        xcodgenProjectTemplatePath = "#{xcodeProjectOutDir}/#{xcodegenProjectFileName}"
        File.open(xcodgenProjectTemplatePath, 'w') { |file| file.write(text) }
        Dir.chdir(xcodeProjectOutDir) do
            system("xcodegen --spec #{xcodegenProjectFileName}")
            system("rm #{xcodegenProjectFileName}")
        end
    end

    private def generate_xcodgen_file_content(params)
        project_name = params[:name]
        target_name = params[:name]
        ios_sdk = params[:sdk]
        bundle_id_prefix = params[:bundleIdPrefix]
        game_src = File.basename(params[:gameSrc])
        target_src = params[:name]
        dev_team_id = params[:developmentTeam]
        
        <<-YML_FILE
        name: #{project_name}
        options:
            bundleIdPrefix: #{bundle_id_prefix}
        targets:
            #{target_name}:
            type: application
            platform: iOS
            deploymentTarget: #{ios_sdk}
            sources:
                - path: #{target_src}
                - path: #{game_src}
                type: folder
                name: html-game
            configFiles:
                Debug: #{target_src}/debug.xcconfig
                Release: #{target_src}/release.xcconfig
            attributes:
                DevelopmentTeam: #{dev_team_id}
        YML_FILE
    end


    private def compile_podfile(params)
        xcodeProjectOutDir = get_xcode_project_out_dir(params)
        podfile_templatePath = File.expand_path("Podfile.erb", xcodeProjectOutDir)
        podfile_path = File.expand_path("Podfile", xcodeProjectOutDir)
        template_text = File.read(podfile_templatePath)
        renderer = ERB.new(template_text)
        result = renderer.result(PofileInput.new(params).get_binding)
        File.write(podfile_path, result)
        File.delete(podfile_templatePath)
    end

    private def get_xcode_project_out_dir(params)
        return params[:xcodeProjectDir]
    end
end
