"use strict";

class ListLink extends React.Component {
    buttonClickHandler(evt) {
        this.props.onClick(this.props.listname, this.props.listid);
    }
    render() {
        return (<div>
                    <a onClick={this.buttonClickHandler.bind(this)} data-list-id={this.props.listid}>{this.props.listname}</a>
                </div>
            );
    }
}

class ProfileInfo extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
                <div className='form-group'>
                    <ul className='list-unstyled'>
                        <li data-info='favRest'>Favorite local restaurant: {this.props.favRest}</li>
                        <li data-info='favDish'>Favorite dish: {this.props.favDish}</li>
                        <li data-info='favCity'>Favorite food city: {this.props.favCity}</li>
                    </ul>
                </div>
            )
    }
}

class ProfileForm extends React.Component {
    constructor(props) {
        super(props);
    }

    uploadPhoto(evt) {
        evt.preventDefault();

        let payload = new FormData();
        let image = evt.target.querySelector('input[type="file"]').files[0];
        let favDish = evt.target.querySelector('input[name="favDish"]').value;
        let favCity = evt.target.querySelector('input[name="favCity"]').value;
        let favRest = evt.target.querySelector('input[name="favRest"]').value;

        if (image) {
            payload.append('image', image);
        }

        payload.append('favRest', favRest);
        payload.append('favDish', favDish);
        payload.append('favCity', favCity);
        payload.append('username', this.props.username);

        $.ajax({
            method: 'POST',
            url: '/update-profile-info.json',
            data: payload,
            dataType: 'json',
            cache: false,
            processData: false,
            contentType: false,
            credentials: 'same-origin'
        }).done((data) => {
            if (data) {
                this.props.onSubmit(data);
            }
        });
    }

    render() {
        return (
                <div>
                    <form onSubmit={this.uploadPhoto.bind(this)} encType='multipart/form-data'>
                        <input className='profile-form' type='file' name='file'></input>
                        <label>Favorite local restaurant:</label>
                        <input type="text" className="form-control profile-form" name="favRest" defaultValue={this.props.favRest}/>
                        <label>Favorite dish:</label>
                        <input type="text" className="form-control profile-form" name="favDish" defaultValue={this.props.favDish}/>
                        <label>Favorite food city:</label>
                        <input type="text" className="form-control profile-form" name="favCity" defaultValue={this.props.favCity}/>
                        <button className='btn btn-default'>Save Profile</button>
                    </form>
                </div>
            )
    }
}
