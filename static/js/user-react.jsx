"use strict";

// instructions for creating a User component
class User extends React.Component {
    constructor(props) {
        super(props);
        this.state = { editingProfile: false, profileImage: '', favDish: '', favCity: '', favRest: ''};
        this.fetchUserInfo = this.fetchUserInfo.bind(this);
        this.fetchUserProfileImage = this.fetchUserProfileImage.bind(this);
    }

    componentDidMount() {
        this.fetchUserInfo();
        this.fetchUserProfileImage();
    }

    fetchUserInfo() {
        fetch('/user-info.json?username=' + this.props.username)
        .then((response) => response.json())
        .then((data) => {
            this.setState({favDish: data.fav_dish, favCity: data.fav_city, favRest: data.fav_rest});
        })
    }

    updateInputValue(evt) {
        this.setState({newListName: evt.target.value});
    }

    fetchUserProfileImage() {
        fetch('/user-profile-image.json?username=' + this.props.username)
        .then((response) => response.json())
        .then((data) => {
            this.setState({profileImage: '/static/uploads/' + data});
        });
    }

    toggleEditMode(evt) {
        this.setState(prevState => ({editingProfile: !prevState.editingProfile}));
    }

    updatePhoto(data) {
        this.setState({editingProfile: false, profileImage: '/static/uploads/' + data.filename, favDish: data.fav_dish, favCity: data.fav_city, favRest: data.fav_rest});
    }

    render() {

        let buttonText;
        let editControls;
        let profileInfo;
        let editProfileForm;

        if (this.state.editingProfile) {
            editProfileForm = <ProfileForm profileImage={this.state.profileImage} favDish={this.state.favDish} favRest={this.state.favRest} favCity={this.state.favCity} onSubmit={this.updatePhoto.bind(this)} username={this.props.username}/>
        }

        else {
            buttonText = 'Edit Profile';
            profileInfo = <ProfileInfo favRest={this.state.favRest} favDish={this.state.favDish} favCity={this.state.favCity}/>
        }

        if (viewingOwnPage && !this.state.editingProfile) {
            editControls =
                    <div>
                        <div id='edit-profile'>
                            <button className='btn btn-default' onClick={this.toggleEditMode.bind(this)}>Edit Profile</button>
                        </div>
                    </div>
        }

        // let cityUrl = '/cities/' + this.props.state.toUpperCase() + '/' + this.props.city.toLowerCase();
        let header =
                <div style={{ display: 'inline-block', float: 'left', height: 120, marginRight: 25 }}>
                    {/*<h1 data-username={this.props.username}>{this.props.username}, a local of <a href={cityUrl}>{this.props.city}</a>.</h1>*/}
                    <img className='profile-image' src={this.state.profileImage}/>
                </div>

        return (
            <div style={{ display: 'inline-block', float: 'right' }}>
                { header }

                <div style={{ display: 'inline-block', float: 'left' }}>
                    { editProfileForm }
                    { profileInfo }
                    { editControls }
                </div>
            </div>
        )
    }
}
