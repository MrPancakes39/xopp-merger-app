const Result = (type, obj) => {
    if (type === "error")
        return {
            ok: false,
            error: obj,
        };
    else if (type === "ok")
        return {
            ok: true,
            value: obj,
        };
    return {};
};

export default Result;
