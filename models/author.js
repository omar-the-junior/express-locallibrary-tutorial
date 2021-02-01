var mongoose = require('mongoose');

var Schema = mongoose.Schema;

const { DateTime } = require('luxon');

var AuthorSchema = new Schema(
    {
        first_name: { type: String, required: true, maxlength: 100 },
        family_name: { type: String, required: true, maxlength: 100 },
        date_of_birth: { type: Date },
        date_of_death: { type: Date },
    }
);

AuthorSchema
    .virtual('name')
    .get(function () {
        return this.family_name + ', ' + this.first_name;
    });

AuthorSchema
    .virtual('lifespan')
    .get(function () {
        let date_of_birth = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
        let date_of_death = DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED);

        if (this.date_of_birth == null && this.date_of_death == null) {
            date_of_birth = 'N/A';
            date_of_death = 'N/A';
        } else if (this.date_of_death == null) {
            date_of_death = 'N/A';
        } else if (this.date_of_birth == null) {
            date_of_birth = 'N/A';
        }

        return date_of_birth + ' - ' + date_of_death;
    });

AuthorSchema
    .virtual('url')
    .get(function () {
        return '/catalog/author/' + this.id
    });

module.exports = mongoose.model('Author', AuthorSchema);