import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

export const User = () => {

    const userSchema = new mongoose.Schema({

        firstName: {
            type: String,
            lowercase: true,
            required: [true, 'Please Provide a first name'],
        },
        lastName: {
            type: String,
            lowercase: true,
            required: [true, 'Please Provide a last name'],
        },
        email: {
            type: String,
            required: [true, 'Please provide your email'],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            select: false,
        },
        role: {
            type: String,
            enum: ['writer', 'editor', 'owner'],
            required: [true, 'Please provide a Role'],
            default: 'writer',
        },
        bio: {
            type: String,
            required: false,
        },
        temporaryPassword: {
            type: String,
            select: false,
        },
        disabled: {
            type: Boolean,
            required: [true, 'Please provide a Disabled status'],
        },
        authenticated: {
            type: Boolean,
            required: [true, 'Please provide an Authenticated status'],
        }
    });

    userSchema.pre('save', async function (next) {
        if (!this.isModified('password')) return next();
        this.password = await bcrypt.hash(this.password, 12);
        next();
    });

    userSchema.pre('findOneAndUpdate', async function (next) {
        if (this._update.password) {
            const hashed = await bcrypt.hash(this._update.password, 12);
            this._update.password = hashed;
        }
        next();
    });


    userSchema.methods.correctPassword = async function (
        candidatePassword,
        userPassword
    ) {
        return await bcrypt.compare(candidatePassword, userPassword);
    };

    return mongoose.model('User', userSchema);

}