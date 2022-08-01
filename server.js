const express = require('express')
const redis = require('redis')
const dotenv = require('dotenv')

dotenv.config()
const app = express()
const redisClient = redis.createClient()

async function redisConn(){
    try{
        await redisClient.connect()
        console.log('Connected to redis-server')
    }catch(err){
        console.log(err)
    }
}

redisConn()

app.use(express.json())

app.post('/',async (req,res)=>{
    try{
        const record = await redisClient.get('body')
        if(record){
            throw new Error('This Key already has a value')
        }
        const data = await redisClient.set('body',JSON.stringify(req.body),{EX:120,NX:true})
        res.json(JSON.parse(data))
    }catch(err){
        console.error(err.message)
    }
})

app.get('/',async (req,res)=>{
    try{
        const data = await redisClient.get('body')
        res.json(JSON.parse(data))
    }catch(err){
        console.error(err.message)
    }
})

app.patch('/',async (req,res)=>{
    try{
        await redisClient.set('body',JSON.stringify(req.body),{EX:120,XX:true})
        res.json({Completed:true})
    }catch(err){
        console.error(err.message)
    }

})

app.delete('/',async (req,res)=>{
    try{
        const data = await redisClient.del('body')
        res.json(data)
    }catch(err){
        console.error(err.message)
    }
})

app.listen(process.env.PORT,()=>{
    console.log(`Server Running on port: ${process.env.PORT}`)
})