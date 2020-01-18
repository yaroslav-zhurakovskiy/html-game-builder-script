def build(params)
  util = BuildGameUtil.new
  util.run(params)
end

def build_from_yml_file()
  input_file_name = ARGV[0]
  if input_file_name.nil?
    input_file_name = 'Game.yml'
  end
  file = File.open(input_file_name)
  params = YAML::load(file)
  params = params.inject({}){|memo,(k,v)| memo[k.to_sym] = v; memo}
  build(params)
end

build_from_yml_file()