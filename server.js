const express = require('express')
const redis = require('redis')
const dotenv = require('dotenv')
const {v4:uuid} = require('uuid')
const {NotFound} = require('http-errors')

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

app.post('/',async (req,res,next)=>{
    try{
        const key = uuid()
        await redisClient.set(key,JSON.stringify(req.body),{EX:3600})
        res.json({Save:true})
    }catch(err){
        next(err)
    }
})

app.get('/',async (req,res,next)=>{
    try{
        const data = await redisClient.keys('*')
        const allKeys = []
        for(let i=0;i<data.length;i++){
            allKeys.push({
                Key: data[i],
                Value: JSON.parse(await redisClient.get(data[i]))
            })
        }
        res.json({AllKeys: allKeys})
    }catch(err){
        next(err)
    }
})

app.get('/:key',async (req,res,next)=>{
    try{
        const data = await redisClient.get(req.params.key)
        if(!data) throw NotFound('This keys doesn\'t exist')
        res.json({Key: req.params.key,Value: JSON.parse(data)})
    }catch(err){
        next(err)
    }
})

app.patch('/:key',async (req,res,next)=>{
    try{
        const data = await redisClient.get(req.params.key)
        if(!data) throw NotFound('This Key doesn\'t exist')
        await redisClient.set(req.params.key,JSON.stringify(req.body),{EX:3600})
        res.json({Updated:true})
    }catch(err){
        next(err)
    }

})

app.delete('/:key',async (req,res,next)=>{
    try{
        const data = await redisClient.get(req.params.key)
        if(!data) throw NotFound('This Key doesn\'t exist')
        await redisClient.del(req.params.key)
        res.json({Deleted: true})
    }catch(err){
        next(err)
    }
})

app.listen(process.env.PORT,()=>{
    console.log(`Server Running on port: ${process.env.PORT}`)
})