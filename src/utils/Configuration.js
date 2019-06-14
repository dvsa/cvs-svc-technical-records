const yml = require('node-yaml')

class Configuration {
  constructor (configPath) {
    this.config = yml.readSync(configPath)

    // Replace environment variable references
    let stringifiedConfig = JSON.stringify(this.config)
    const envRegex = /\${(\w+\b):?(\w+\b)?}/g
    const matches = stringifiedConfig.match(envRegex)

    if (matches) {
      matches.forEach((match) => {
        envRegex.lastIndex = 0
        const captureGroups = envRegex.exec(match)

        // Insert the environment variable if available. If not, insert placeholder. If no placeholder, leave it as is.
        stringifiedConfig = stringifiedConfig.replace(match, (process.env[captureGroups[1]] || captureGroups[2] || captureGroups[1]))
      })
    }

    this.config = JSON.parse(stringifiedConfig)
  }

  /**
     * Retrieves the singleton instance of Configuration
     * @returns Configuration
     */
  static getInstance () {
    if (!this.instance) {
      this.instance = new Configuration('../config/config.yml')
    }

    return Configuration.instance
  }

  /**
     * Retrieves the entire config as an object
     * @returns any
     */
  getConfig () {
    return this.config
  }

  /**
     * Retrieves the lambda functions declared in the config
     * @returns IFunctionEvent[]
     */
  getFunctions () {
    if (!this.config.functions) {
      throw new Error('Functions were not defined in the config file.')
    }

    return this.config.functions.map((fn) => {
      const [name, params] = Object.entries(fn)[0]
      const path = (params.proxy) ? params.path.replace('{+proxy}', params.proxy) : params.path

      return {
        name,
        method: params.method.toUpperCase(),
        path,
        function: require(`../functions/${params.function}`)[name],
        event: params.event
      }
    })
  }

  /**
     * Retrieves the DynamoDB config
     * @returns any
     */
  getDynamoDBConfig () {
    if (!this.config.dynamodb) {
      throw new Error('DynamoDB config is not defined in the config file.')
    }

    // Not defining BRANCH will default to local
    var env
    switch (process.env.BRANCH) {
      case 'local':
        env = 'local'
        break
      case 'local-global':
        env = 'local-global'
        break
      default:
        env = 'remote'
    }

    return this.config.dynamodb[env]
  }

  getEndpoints (endpoint) {
    if (!this.config.endpoints) {
      throw new Error('Endpoints were not defined in the config file.')
    }

    // Not defining BRANCH will default to local-global
    var env
    switch (process.env.BRANCH) {
      case 'local-global':
        env = 'local-global'
        break
      default:
        env = 'remote'
    }

    return this.config.endpoints[env]
  }
}

module.exports = Configuration
