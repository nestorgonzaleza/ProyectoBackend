import UserDTO from "../dao/DTOs/users.dto.js";

export default class UserRepository {
    constructor(dao) {
        this.dao = dao
    }

    getUsers = async () => {
        let result = await this.dao.get()
        return result
    }

    createUser = async (user) => {
        let userToCreate = new UserDTO(user)
        let result = await this.dao.addUser(userToCreate)
        return result
    }

    
}