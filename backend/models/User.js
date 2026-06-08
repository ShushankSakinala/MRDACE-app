const { User: UserModel } = require('./mongoModels');

class UserWrapper {
    async findById(id) {
        try {
            // Check if it's a valid MongoDB ID, if not maybe try by firebaseId
            const user = await UserModel.findById(id);
            if (!user) {
                return await UserModel.findOne({ firebaseId: id });
            }
            return this._transform(user);
        } catch (e) {
            // If it's not a valid format for Mongoose findById, try firebaseId
            return await UserModel.findOne({ firebaseId: id }).then(u => this._transform(u));
        }
    }

    async findByUsername(username) {
        const user = await UserModel.findOne({ username });
        return this._transform(user);
    }

    async create(userData) {
        const { username, hashed_password, full_name, role } = userData;
        const exists = await this.findByUsername(username);
        if (exists) throw new Error('Username already exists');

        const newUser = await UserModel.create({
            username,
            hashed_password,
            full_name,
            role,
            is_active: 1
        });
        return newUser._id.toString();
    }

    async listAll() {
        const users = await UserModel.find({});
        return users.map(u => this._transform(u, true)); // skip details if needed, but we keep it simple here
    }

    async updateRole(id, role) {
        try {
            await UserModel.findByIdAndUpdate(id, { role });
        } catch (e) {
            await UserModel.findOneAndUpdate({ firebaseId: id }, { role });
        }
        return { changes: 1 };
    }

    _transform(user, skipPassword = false) {
        if (!user) return null;
        const data = user.toObject();
        const id = data._id.toString();
        if (skipPassword) delete data.hashed_password;
        return { id, ...data };
    }
}

module.exports = new UserWrapper();
