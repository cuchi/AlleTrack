import AsyncStorage from "@react-native-community/async-storage";
import createDataContext from './createDataContext';
import trackerApi from '../api/tracker';
import { navigate } from '../navigationRef';

const authReducer = (state, action) => {
  switch (action.type) {
    case "add_error":
      return { ...state, errorMessage: action.payload };
    case "signin":
      return { errorMessage: "", token: action.payload };
    case "clear_error_message":
      return { ...state, errorMessage: "" };
    case "signout":
      return { token: null, errorMessage: "" };
    default:
      return state;
  }
};

const tryLocalSignin = (dispatch) => async() => {
  //====>Getting Token From AsyncStorage<====/
  const token = await AsyncStorage.getItem('token');

  //===>Checking<===/
  if (token) {
    dispatch({type: 'signin', payload: token});
  }else {
    navigate('loginFlow');
  }

  //===> Navigation<===/
  navigate('TrackList');
};

//Clearing error messages(new syntax)
const clearErrorMessage = (dispatch) => () => {
  dispatch({
    type: 'clear_error_message',
  });
};

// const clearErrorMessage = (dispatch) => {
//   dispatch({typ: 'clear_error_message'});
// };


// Signup
const signup = dispatch => async ({ email, password }) => {
  try {
    const response = await trackerApi.post('/signup', { email, password });
    await AsyncStorage.setItem('token', response.data.token);
    dispatch({ type: 'signin', payload: response.data.token});

    navigate('TrackList');
  } catch (err) {
    dispatch({
      type: 'add_error',
      payload: 'Something went wrong with sign up'
    });
  }
};


// SignIn
const signin = dispatch => async({ email, password }) => {
  try {
    const response = await trackerApi.post('/signin', {email, password});
    await AsyncStorage.setItem('token', response.data.token);
    dispatch({type: 'signin', payload: response.data.token});
    navigate('TrackList');
  } catch (error) {
    dispatch({
      type: 'add_error',
      payload: 'Something went wrong with sign in'
    });
  }
    // Handle success by updating state
    // Handle failure by showing error message (somehow)
};


// Destroy Session
const signout = (dispatch) => async () => {
  await AsyncStorage.removeItem("token");
  dispatch({ type: "signout" });
  navigate("loginFlow");
};


export const { Provider, Context } = createDataContext(
  authReducer,
  { signin, signout, signup, clearErrorMessage, tryLocalSignin},
  { token: null, errorMessage: '' }
);
