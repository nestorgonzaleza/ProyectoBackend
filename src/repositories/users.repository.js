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

    getRoleUser = async (email) => {
        let result = await this.dao.getUserRoleByEmail(email)
        return result
    }

    updUserRole = async ({uid, rol}) => {
        let result = await this.dao.updateUserRoleById({uid, rol})
        return result
    }
}
