"use strict";


class User extends React.Component {
    constructor(props) {
        super(props);
        this.state = {editProfileMode: false, favDish: '', profileImage: '', favCity: '', favRest: ''};
        this.fetchUserInfoAjax = this.fetchUserInfoAjax.bind(this);
    }

    componentWillMount() {
        this.fetchUserInfoAjax();

    }

    // GET USER LISTS USING AJAX

    fetchUserInfoAjax() {
        $.get('/user-info-react.json?username=' + this.props.username, (data) => {
            console.log(data);
            this.setState({favDish: data.fav_dish, profileImage: '/static/uploads/' + data.image_fn,
                          favCity: data.fav_city, favRest: data.fav_rest});
        }
    );
    }

    uploadPhoto(evt) {
        evt.preventDefault();

        let payload = new FormData();
        let image = document.querySelector('input[type="file"]').files[0];

        payload.append('image', image);
        payload.append('username', this.props.username);

        $.ajax({
            method: 'POST',
            url: '/upload-profile-image',
            data: payload,
            dataType: 'json',
            cache: false,
            processData: false,
            contentType: false,
            credentials: 'same-origin'
        }).done((data) => {
            this.setState({profileImage: '/static/uploads/' + data});
        });
    }

    render() {

        // let mainDiv = [];

        // for (let i = 0; i < this.state.userLists.length; i++) {
        //             mainDiv.push(<ListLink key={i} listid={this.state.userLists[i].list_id} listname={this.state.userLists[i].name} displayListHandler={this.fetchListItemsAjax.bind(this)}/>);
        //     }


        // RENDER HEADING OF PAGE
        let cityUrl = '/cities/' + this.props.state.toUpperCase() + '/' + this.props.city.toLowerCase();

        let header =
                <div>
                    <p id='msg-para'></p>
                    <h1>{this.props.username}, a local of <a href={cityUrl}>{this.props.city}</a>.</h1>
                    <img className='profile-image' src={this.state.profileImage}/>
                    <form onSubmit={this.uploadPhoto.bind(this)} encType='multipart/form-data'>
                        <input type='file' name='file'></input>
                        <button>Upload</button>
                    </form>
                    <p>Favorite local restaurant: {this.state.favRest}</p>
                    <p>Favorite dish: {this.state.favDish}</p>
                    <p>Favorite food city: {this.state.favCity}</p>
                </div>

        // let editUserControls;

        // // DISPLAY LIST CONTROLS IF USER IS VIEWING THEIR OWN PAGE

        // if (viewingOwnPage) {
        //     editUserControls =
        //             <div>
        //                 <div id='edit-profile'>
        //                     <h3>Edit Your Profile</h3>
        //                     <form>
        //                         <label>Name</label>
        //                         <input name='favorite-place' onChange={this.updateInputValue.bind(this)} required></input>
        //                         <button>Submit</button>
        //                     </form>
        //                 </div>
        //             </div>
        // }

        return (<div>
                    {header}
                </div>);
    }
}
