class ApiFeature{
    constructor(query,strQuery){
        this.query = query,
        this.strQuery = strQuery
    }
    search(){
    const keyword = this.strQuery.keyword ? (
        {
            name:{
                $regex: this.strQuery.keyword,
                $options:"i"
            }
        }
    ):({});
    console.log(keyword);
    this.query = this.query.find({...keyword});
    return this
    }
}
module.exports = ApiFeature