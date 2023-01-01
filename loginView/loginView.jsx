import React from 'react'

export const loginView = () => {

    const handdleSubmit = (event) => {
        event.preventDefault();

        const data = {
            access: username,
            seceret: password
        };

        fetch('', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then ((response) => response.json())
            .then((data) => {
                console.log('Login response: ', data);
                if (data.user) {
                    onLoggedin(data.user, data.token); 
                } else {
                    alert('No such User');
                }
            if (response.ok) {
                onLoggedin(username);
            } else{
                alert('Login failed');
            }
        })
        .catch((e) => {
            alert('Something went wrong')
        });  
    };

  return (
    <form>
        <label>
            Username: 
            <input 
            type='text'
            value = {username}
            onChange = {(e) => setUsername(e.target.value)}
            required 
            />
        </label>
        <label>
            Password: 
            <input 
            type = 'Password'
            value = {password}
            onChange = {(e) => setPassword(e.target.value)}
            required
            />
        </label>
        <button type='Submit'>
            Submit
        </button>
    </form>
  );
};
