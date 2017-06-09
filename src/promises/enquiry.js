import Enquiry from '../models/Enquiry.js'

export const postNewEnquiry = (body) => {
    const newEnquiry = new Enquiry({
        name: body.name,
        email: body.email,
        phone: body.phone,
        content: body.content,
    })
    return newEnquiry.save()
}

export const getEnquiriesByPage = (page, nPerPage) => {
    return Enquiry.find({})
        .skip(page * nPerPage)
        .limit(nPerPage)
        .exec()
}

export const removeEnquiry = (id) => {
    return Enquiry.findByIdAndRemove(id).exec()
}
