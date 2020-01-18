def build(params)
  util = BuildGameUtil.new
  util.run(params)
end

def get_yml_file_name()
  input_file_name = ARGV[0]
  if input_file_name.nil?
    input_file_name = 'Game.yml'
  end
  input_file_name
end

def check_yml_file_presence(file_name)
  if !File.exist?(file_name)
    puts "Configuration file #{file_name} was not found!"
    exit(-1)
  end
end

def build_from_yml_file()
  file_name = get_yml_file_name
  check_yml_file_presence(file_name)
  file = File.open(file_name)
  yaml_file_content = YAML::load(file)
  params = yaml_file_content.inject({}){|memo,(k,v)| memo[k.to_sym] = v; memo}
  build(params)
end

build_from_yml_file()
