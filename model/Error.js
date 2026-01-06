class CustomError {
	constructor(status, title, detail) {
		this.status = status;
		this.title = title;
		this.detail = detail;
	}
}
module.exports = CustomError;