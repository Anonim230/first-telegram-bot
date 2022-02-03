const fs = require('fs');
const path = require('path');
class Database {
    #db = {}
    constructor(object) {
        this.#db = object
    }
    read(key) {
        if (!this.#db[key]) return false
        return JSON.parse(fs.readFileSync(path.resolve(__dirname, '../', this.#db[key]), 'utf8'))
    }
    write(key, ...params) {
            if (!this.#db[key]) return false
            let chunk = this.read(key)
            chunk.push(...params)
            this.#db[key].onChange ? this.#db[key].onChange() : undefined
            return fs.writeFileSync(path.resolve(__dirname, '../', this.#db[key]), JSON.stringify(chunk, null, 4))
        }
        /* onchange(func, forDB = ''){
            // (forDB ? this.#db[forDB] : undefined).onChange =  func
            console.log((this.#db[forDB]))
            if(forDB)(this.#db[forDB]).onChange = func
            else this.#db.forEach(element => element.onChange = func);
        }*/
}
module.exports = Database