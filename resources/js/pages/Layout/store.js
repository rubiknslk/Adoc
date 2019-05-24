import {createStore} from "redux";


// const getUser = () => {
//     return async () => {
//         let user = {};
//         await axios.get('/user').then((data) => {
//             user = data;
//         }).catch(()=>{});
//         return user;
//     }
// };

function user(state, action){
    switch (action.type) {
        case 'login':
        case 'register':
            state = true;
            break;
        case 'password':
        case 'logout':
        default:
            state = false;
            break;
    }
    return state;
}

const User = createStore(user);

export {User}
