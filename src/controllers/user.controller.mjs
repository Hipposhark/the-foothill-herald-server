export const userController = ({ userService }) => {

    return {
        register: async (req, res) => {
            const newUser = await userService.createUser(req.body)
            res.status(201).json(newUser)
        },

        login: async (req, res) => {
            if (!req.body.email || !req.body.password) {
                res.status(401).json({
                    detail: "Missing Username or Password"
                })
            } else {
                const newUser = await userService.login(req.body)
                console.log(newUser)
                res.status(200).json(newUser)
            }
        },

        authenticateUser: async (req, res) => {
            if (!req.body.newPassword || !req.body.confirmNewPassword) {
                res.status(401).json({
                    detail: "Missing New Password or Confirm New Password"
                })
            } else if (req.body.newPassword !== req.body.confirmNewPassword) {
                res.status(401).json({
                    detail: "Incorrect New Password Confirmation"
                })
            } else {
                const newUser = await userService.authenticateUser({
                    _id: req.body._id,
                    newPassword: req.body.newPassword,
                })
                res.status(200).json(newUser)
            }
        },

        changePassword: async (req, res) => {
            if (!req.body.oldPassword || !req.body.newPassword || !req.body.confirmNewPassword) {
                res.status(401).json({
                    detail: "Missing Old Password, New Password, or Confirm New Password"
                })
            } else if (req.body.newPassword !== req.body.confirmNewPassword) {
                res.status(401).json({
                    detail: "Incorrect New Password Confirmation"
                })
            } else {
                const newUser = await userService.changePassword({
                    _id: req.body._id,
                    oldPassword: req.body.oldPassword,
                    newPassword: req.body.newPassword,
                })
                res.status(200).json(newUser)
            }
        },

        updateProfile: async (req, res) => {
            const newUser = await userService.updateProfile({
                _id: req.body._id,
                changes: req.body.changes,
            })

            res.status(200).json(newUser)
        },

        deleteUser: async (req, res) => {
            await userService.deleteUser({ _id: req.body._id, })
            res.status(200).json()
        },

        getUsers: async (req, res) => {
            const users = await userService.getUsers()
            res.status(200).json(users)
        },

        refreshToken: async (req) => {
            let token;
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1];
                return await userService.refreshToken(token);
            }
            return null
        },
    }
}