class XcodeProjecBuilder
  def build(params)
    Dir.chdir(params[:xcodeProjectDir]) do
      system("fastlane build_game")
    end
  end

  def upload(params)
    Dir.chdir(params[:xcodeProjectDir]) do
      system("fastlane upload_game")
    end
  end
end
