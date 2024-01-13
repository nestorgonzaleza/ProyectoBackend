import mongoose from 'mongoose'
import User from '../dao/mongo/users.mongo.js'
import Assert from 'assert'
import Chai from 'chai'
import Supertest from 'supertest'
import config from '../config/config.js' 

mongoose.connect(config.mongo_url);

const assert = Assert.strict
const expect = Chai.expect
const requester = Supertest("http://localhost:8080")

describe('Test para User Mocha + Chai + SuperTest', () => {
    before(function () {
        this.usersDao = new User()
    })
    it("Obtener los usuarios de la DB", async function () {
        this.timeout(5000)
        try
        {
            const result = await this.usersDao.get()
            assert.strictEqual(Array.isArray(result), true) //Mocha
            expect(Array.isArray(result)).to.be.equals(true) //Chai
        }
        catch(error)
        {
            console.error("Falló el test: ", error)
            assert.fail("Testeo get de usuarios fallido")
        }
    })
    it("Agregar a un usuario en la DB", async function () {
        let mockUser = {
            first_name: "Testeo nombre",
            last_name: "Testeo apellido",
            email: "test@mochai.com",
            age: 40,
            password: "123",
            role: "admin"
        }
        const result = await this.usersDao.addUser(mockUser)
        assert.ok(result._id) // de Mocha
        expect(result).to.have.property('_id') // de Chai
    })
    it("Devolver un usuario despues de colocar un correo", async function () {
        let emailToFind = "premium@coder.cl"
        const result = await this.usersDao.findEmail({ email: emailToFind })
        assert.strictEqual(typeof result, "object") //con Mocha
        expect(result).to.be.an('object') //con Chai
    })
    it("El DAO debe devolver un usuario despues de colocar un parametro cualquiera", async function () {
        let filterData = { first_name: 'premium'}
        const result = await this.usersDao.findJWT(filterData)
        assert.strictEqual(typeof result, "object") //con Mocha
        expect(result).to.be.an('array'); //con Chai
    })
    //CON 2 TERMINALES
    it("El endpoint GET /api/users debe devolver todos los usuarios", async function() {
        const response = await requester.get('/api/users')
        // Verifica el código de estado HTTP
        assert.strictEqual(response.status, 200);
        // Verifica el tipo de contenido de la respuesta
        expect(response.type).to.equal('application/json');
        // Verifica que la respuesta tenga una propiedad 'status' con valor 'success'
        expect(response.body).to.have.property('status', 'success');
    })
    it("El endpoint POST /api/users debe crear un usuario", async function() {
        this.timeout(50000)
        let mockUser = {
            first_name: "testnombre",
            last_name: "testap",
            email: "coder@mail.com",
            age: 33,
            password: "123",
            role: "admin"
        }
        
        const response = await requester.post('/api/users').send(mockUser)
        // Verifica el código de estado HTTP
        assert.strictEqual(response.status, 200);
        // Verifica el tipo de contenido de la respuesta
        expect(response.ok).to.equal(true);
        // Verifica que la respuesta tenga una propiedad 'status' con valor 'success'
        expect(response.body).to.have.property('status', 'success');
    })
    after(function(done) {
        this.timeout(5000);
        console.log("Test de Usuario finalizado");
        done();
    });
})