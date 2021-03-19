export const currencyFormatter = (currency) => {
    try {
        if(currency) {
            return (currency).toLocaleString('en-US', {
                style: 'currency',
                currency: 'INR',
            });
        } else {
            return null;
        }
    } catch(e) {
        //TODO: Add Log
        return currency;
    }
}

export const numberFormatter = (aNumber, precision=2) => {
    try {
        if(aNumber) {
            return aNumber.toFixed(precision);
        } else {
            return aNumber;
        }
    } catch(e) {
        return aNumber;
    }
}

export const currencyFormatterOld = (val) => {
    try {
        let valStr = val.toString();
        let yy = valStr.split('').reverse();
        let res = [];
        for(let i=1;i<=yy.length; i++) {
            res.push(yy[i-1]);
            if(i%3==0 && i!=yy.length)
                res.push(',');
        }
        return res.reverse().join('');
    } catch(e) {
        console.log(e);
        return val;
    }
}