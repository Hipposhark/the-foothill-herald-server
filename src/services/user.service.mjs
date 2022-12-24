import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken"

export const userService = ({ dbUser }) => {

    const signToken = (id) => {
        return jwt.sign({ id }, process.env.JWT_SIGNATURE, {
            expiresIn: "1h", //milliseconds
        })
    }

    return {
        createUser: async (body) => {
            const account = {
                firstName: body.account.firstName,
                lastName: body.account.lastName,
                email: body.account.email,
                role: body.account.role,
                graduateYear: body.account.graduateYear,
                bio: body.account.bio,
                password: body.account.temporaryPassword,
                temporaryPassword: body.account.temporaryPassword,
                authenticated: body.account.authenticated,
                disabled: body.account.disabled,
            }

            let newUser

            try {
                newUser = await dbUser.create(account)
                return newUser
            } catch (e) {
                if (e.code === 11000) {
                    throw {message: "Duplicate Email"}
                } else{
                    throw {message: e}
                }
            }
        },

        login: async (body) => {
            const { email, password: passwordInput } = body

            let user

            try {
                user = await dbUser.findOne({ email }).select('+password')

                if (!user) {
                    throw { message: "Invalid Login Credentials" }
                }
                if (!await bcrypt.compare(passwordInput, user.password)) {
                    throw { message: "Invalid Password" }
                }
            } catch (e) {
                throw e
            }

            const token = signToken(user._id)
            const newUser = user._doc
            delete newUser.password

            return { token, ...newUser, _id: newUser._id.toString() }
        },

        authenticateUser: async (body) => {
            const { _id, newPassword, } = body

            let newUser

            try {
                newUser = await dbUser.findByIdAndUpdate(
                    _id,
                    { password: newPassword, authenticated: true },
                    { new: true, runValidators: true, }
                )
                return newUser
            } catch (e) {
                throw e
            }


        },

        changePassword: async (body) => {
            const { _id, oldPassword, newPassword } = body

            let newUser

            try {
                newUser = await dbUser.findById(_id).select('+password')

                if (!await bcrypt.compare(oldPassword, newUser.password)) {
                    throw { message: "Invalid New Password" }
                }

                await dbUser.findByIdAndUpdate(_id, { password: newPassword })

            } catch (e) {
                throw e
            }
        },

        updateProfile: async (body) => {
            const { _id, changes } = body

            let newUser
            try {
                newUser = await dbUser.findByIdAndUpdate(
                    _id,
                    changes,
                    { new: true, runValidators: true, }
                )

                return newUser
            } catch (e) {
                throw e
            }


        },

        deleteUser: async (body) => {
            const { _id } = body

            try {
                await dbUser.findByIdAndDelete(_id)
            } catch (e) {
                throw e
            }
        },

        getUsers: async () => {
            try {
                const users = await dbUser.find().select('+temporaryPassword')
                const userMap = {
                    owners: [],
                    editors: [],
                    writers: [],
                }
                
                if (users) {
                    users.map((curr) => {
                        if (curr) {
                            const role = curr.role
                            switch (role) {
                                case 'owner':
                                    userMap.owners.push(curr)
                                    break
                                case 'editor':
                                    userMap.editors.push(curr)
                                    break
                                case 'writer':
                                    userMap.writers.push(curr)
                                    break
                            }
                        }
                    })
                }
                return userMap
            } catch (e) {
                throw e
            }
        },

        refreshToken: async (token) => {
            let decoded, user, newToken
            try {
                decoded = await promisify(jwt.verify)(token, process.env.JWT_SIGNATURE)
                user = await dbUser.findById(decoded.id)
                if (!user) next({ message: "User Not Found" })
                newToken = signToken(user._id)
                return { newToken }
            } catch (e) {
                if (e instanceof SyntaxError) next({ message: "Invalid Token" })
                throw makeError(404, "generic error", "generic_fail")
            }
        }
    }
}