"use strict";


class User extends React.Component {
    constructor(props) {
        super(props);
        this.state = {editingProfile: false, favDish: '', profileImage: '', favCity: '', favRest: ''};
        this.fetchUserInfoAjax = this.fetchUserInfoAjax.bind(this);
        this.fetchUserProfileImage = this.fetchUserProfileImage.bind(this);
    }

    componentWillMount() {
        this.fetchUserProfileImage();
        this.fetchUserInfoAjax();

    }

    // GET USER LISTS USING AJAX

    fetchUserInfoAjax() {
        $.get('/user-info-react.json?username=' + this.props.username, (data) => {
            this.setState({favDish: data.fav_dish, favCity: data.fav_city, favRest: data.fav_rest});
        });
    }


    fetchUserProfileImage() {
        $.get('/user-profile-image.json?username=' + this.props.username, (data) => {
            this.setState({profileImage: '/static/uploads/' + data});
        });
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
            if (data) {
                this.setState({profileImage: '/static/uploads/' + data});
            }
            else {
                alert('Please select a file to upload.');
            }
        });
    }


    toggleEditMode(evt) {
        this.setState(prevState => ({editingProfile: !prevState.editingProfile}));
    }


    render() {


        let buttonText;
        let editControls;

        if (this.state.editingProfile) {
            buttonText = 'Save Profile';
        }

        else {
            buttonText = 'Edit Profile';
        }

        if (viewingOwnPage) {
            editControls =
                    <div>
                        <div id='edit-profile'>
                            <button onClick={this.toggleEditMode.bind(this)}>{ buttonText }</button>
                        </div>
                    </div>
        }

        let updatePhotoForm;

        // DISPLAY LIST CONTROLS IF USER IS VIEWING THEIR OWN PAGE

        if (this.state.editingProfile) {
            updatePhotoForm =
                    <div>
                        <form onSubmit={this.uploadPhoto.bind(this)} encType='multipart/form-data'>
                            <input type='file' name='file'></input>
                            <button>Upload</button>
                        </form>
                    </div>
        }

        // RENDER HEADING OF PAGE
        let cityUrl = '/cities/' + this.props.state.toUpperCase() + '/' + this.props.city.toLowerCase();

        let header =
                <div>
                    <p id='msg-para'></p>
                    <h1>{this.props.username}, a local of <a href={cityUrl}>{this.props.city}</a>.</h1>
                    <img className='profile-image' src={this.state.profileImage}/>
                    {updatePhotoForm}
                </div>

        let profileDetails =
                <div>
                    <ul>
                        <li data-info='favRest' onClick={this.toggleEditMode.bind(this)}>Favorite local restaurant: {this.state.favRest}</li>
                        <li data-info='favDish' onClick={this.toggleEditMode.bind(this)}>Favorite dish: {this.state.favDish}</li>
                        <li data-info='favCity' onClick={this.toggleEditMode.bind(this)}>Favorite food city: {this.state.favCity}</li>
                    </ul>
                </div>


        return (<div>
                    {header}
                    {profileDetails}
                    {editControls}
                </div>);
    }
}