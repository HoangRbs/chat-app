const users = [];

const addUser =({id,userName,room}) => {
    userName = userName.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if(!userName || !room)
        return {
            error: 'username and room required'
        }
    
    const existUser = users.find((user) => {
        return user.userName === userName && user.room === room;
    });

    if(existUser){
        return {
            error: 'userName is in use'
        }
    }

    const newUser = {id,userName,room};
    users.push(newUser);
    return { newUser };
}

const removeUser =(id) => {
    const index = users.findIndex((user) => user.id === id);
    
    if(index !== -1){
        return users.splice(index,1)[0];
    }
}

const getUser =(id) =>{
    const user = users.find((user) => user.id === id );

    return user;
}

const getUsersInRoom =(room) => {
    return users.filter((user) => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

