const users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    //validate
    if (!username || !room) {
        return{
            error:'username and room are required!!'
        }
    }
    
    //check for exisiting user
    const existingUser= users.find((user)=>{
        return user.room===room && user.username===username;
    })
    if(existingUser){
        return{
            error:'username is alredy taken'
        }
    }
    //console.log(username,room)
    const user ={id,username,room}
    users.push(user);

    return {user};
}

const removeUser=(id)=>{
    const index= users.findIndex((user)=>{
        return user.id===id;
    })
    if(index===-1){
        return {
            error:'user is not present'
        }
    }
    return users.splice(index,1)[0];
}
const getUser=(id)=>{
    const user = users.find( user=>{
        return user.id===id;
    })
   
    return user;
}

const getUsersInRoom=(room)=>{
    const usersInRoom= users.filter((user)=>{
        return user.room===room;
    })
    
    return usersInRoom;
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}