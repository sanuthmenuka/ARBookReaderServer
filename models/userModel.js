const mongoose=require('mongoose')
const Schema=mongoose.Schema
const bcrypt=require('bcrypt')
const validator=require('validator')

const userSchema=new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    profilePicture: {
        type: String,
      },
    addedtoLibrary: {
        type: Array,
        default: [],
      },
    publisher: {
        type: Boolean,
        default: false,
      },
    publishedBooks: {
        type: Array,
        default: [],
      },
    paid: {
        type: Boolean,
        default: false,
      },
    userRole:{
        type: String,
        default: "public",
    }
})

//static signup method
userSchema.statics.signup=async function(firstName,lastName,email, password,confirmPassword){
    
    //validation
    if(!firstName || !lastName || !email||!password || !confirmPassword){ 
        throw Error('All fields must be filled')
    }

    if(!validator.isEmail(email)){
        throw Error('Email is not valid')

    }

    if(!validator.isStrongPassword(password)){
        throw Error('Password is not strong enough')
    }
    //Check if password nd the confirm passsword values are equal
    if(password !== confirmPassword){
        throw Error('Passwords are not matching')
    }


    const exists=await this.findOne({email})

    if(exists){
        throw Error('Email already exists')
    }

    const salt=await bcrypt.genSalt(10)
    const hash=await bcrypt.hash(password,salt)

    const user=await this.create({firstName,lastName,email,password:hash})

    return user

}


//static login method
userSchema.statics.login=async function(email,password){

    if(!email||!password){
        throw Error('All fields must be filled')
    }
    const user=await this.findOne({email})

    if(!user){
        throw Error('Incorrect user credentials')
    }
    
    const match=await bcrypt.compare(password,user.password)

    if(!match){
        throw Error('Incorrect user credentials')
    }

    return user;
}

module.exports=mongoose.model('User',userSchema)