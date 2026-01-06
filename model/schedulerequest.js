let o  = function(data)
{
    this.category=data["category"]
	this.start=data["start"]
	this.end=data["end"]
	this.workId=data["workId"]
	this.description=data["description"]
	this.workType=data["workType"]
	this.files=data["files"]
	this.market=data["market"]
	this.submarket=data["submarket"]
	this.siteNo=data["siteNo"]
	this.siteName=data["siteName"]
	this.siteUnid=data["siteUnid"]
	this.switchUnid=data["switchUnid"]
	this.switchName=data["switchName"]
	this.vendorCompanyName=data["vendorCompanyName"]
	this.vendorTechName=data["vendorTechName"]
	this.status=data["status"]
	this.vendorId=data["vendorId"]
	this.loginId=data["loginId"]
	this.loginName=data["loginName"]
	this.woDevices=data["woDevices"]
	this.engineerLoginId=data["engineerLoginId"]
	this.ticketNo=data["ticketNo"]
	this.ticketSource=data["ticketSource"]
	this.comments=data["comments"]
	this.mop = data["mop"]
	this.projectType = data["projectType"]
	this.fieldEngineer = data["fieldEngineer"]
}


module.exports = o;