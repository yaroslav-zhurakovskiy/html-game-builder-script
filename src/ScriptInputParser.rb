class ScriptInputParser
    def initialize()
        @args = {}
        @opt_parser = OptionParser.new do |opts|
            opts.banner = "Usage: #{SCRIPT_NAME} [options]"
      
            opts.on("-cNAME", "--config=NAME", "Specify a custom config file, by default Game.yml is used") do |n|
              @args[:config] = n
            end
      
            opts.on("-g", "--generate", "Generates an xcode project") do |n|
              @args[:action] = :generate
            end
      
            opts.on("-u", "--upload", "Generates an xcode project, builds it and uploads the build to Testflight") do |n|
              @args[:action] = :upload
            end
      
            opts.on("-b", "--build", "Generates an xcode project and builds an ipa file") do |n|
              @args[:action] = :build
            end
      
            opts.on("-h", "--help", "Prints this help") do
              @args[:action] = :help
            end

            opts.on("-v", "--version", "Prints the script version") do
              @args[:action] = :version
            end
        end
    end

  def parse(options)
    begin
      @opt_parser.parse!(options)
      return @args
    rescue OptionParser::InvalidOption => error
      puts error
      exit(-1)
    end
  end

  def print_help
    puts @opt_parser
  end
end
