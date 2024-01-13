import mongoose from 'mongoose'
import Product from '../dao/mongo/products.mongo.js'
import Assert from 'assert'
import Chai from 'chai'
import Supertest from 'supertest'
import config from '../config/config.js' 

mongoose.connect(config.mongo_url);

const assert = Assert.strict
const expect = Chai.expect
const requester = Supertest("http://localhost:8080")

describe('Test para Product Mocha + Chai + SuperTest', () => {
    before(function () {
        this.productsDao = new Product()
    })
    it("Obtener los productos de la DB", async function () {
        this.timeout(5000)
        try
        {
            const result = await this.productsDao.get()
            assert.strictEqual(Array.isArray(result), true) //usando Mocha
            expect(Array.isArray(result)).to.be.equals(true) //usando Chai
        }
        catch(error)
        {
            console.error("Falló el test: ", error)
            assert.fail("Testeo get de productos fallido")
        }
    })
    it("Agregar un producto en la DB", async function () {
        let mockProduct = {
            name:"test producto",
            description: "testdescrip",
            price: 1500,
            stock: 80,
            category: "testcateg",
            availability: "available_stock",
            owner: "testown"
        }
        const result = await this.productsDao.addProduct(mockProduct)
        assert.ok(result._id) //con Mocha
        expect(result).to.have.property('_id') //con Chai
    })
    it("Actualizar producto", async function () {
        let prodId = "65a0a47fc887e301b05f6fcd"
        let mockProductUpd = {
            name: "test nombre act",
            description: "Test descrip act",
            price: 333,
            stock: 33,
            category: "Test categ act",
            availability: "available_stock",
            owner: "bodoque"
        }
        const result = await this.productsDao.updateProduct(prodId, mockProductUpd )
        assert.strictEqual(typeof result, "object") //con Mocha
        expect(result).to.be.an('object') //con Chai
    })
    it("Eliminar un producto", async function () {
        let prodId = "65a0a47fc887e301b05f6fcd" // El ID debe actualizarse para cada testeo
        const result = await this.productsDao.deleteProduct(prodId)
        assert.strictEqual(typeof result, "object") // para Mocha
        expect(result).to.be.an('object') //para Chai
    })
    //CON 2 TERMINALES
    it("El endpoint GET /api/products debe devolver todos los productos", async function() {
        const response = await requester.get('/api/products')
        // Verifica el código de estado HTTP
        assert.strictEqual(response.status, 200);
        // Verifica el tipo de contenido de la respuesta
        expect(response.type).to.equal('application/json');
        // Verifica que la respuesta tenga una propiedad 'status' con valor 'success'
        expect(response.body).to.have.property('status', 'success');
    })
    it("El endpoint POST /api/products debe crear un producto", async function() {
        let mockProduct = {
            name: "test post api/products",
            description: "Testeo POST",
            price: 2540,
            stock: 100,
            category: "Testeo POST categ",
            availability: "available_stock",
            owner: "Testeo POST own"
        }
        
        const response = await requester.post('/api/products').send(mockProduct)
        // Verifica el código de estado HTTP
        assert.strictEqual(response.status, 200);
        // Verifica el tipo de contenido de la respuesta
        expect(response.ok).to.equal(true);
        // Verifica que la respuesta tenga una propiedad 'status' con valor 'success'
        expect(response.body).to.have.property('status', 'success');
    })
    after(function(done) {
        this.timeout(5000);
        console.log("Test de Producto finalizado");
        done();
    });
})