import React, { Component } from 'react';
import { connect } from 'react-redux';
import OrderBook from '../trade/orderbook/orderbook';

class SmartComponent extends Component {
    render() {
        if(this.props.auth.isAuthenticated) {
            return (
                <>
                    <div>
                        <header>

                        </header>
                    </div>
                    <div className='page-content'>
                        <OrderBook />
                    </div>
                </>
            )
        } else {
            return (
                <>
                    <div>LOGIN SCREEN</div>
                </>
            )
        }
    }
}

const mapStateToProps = (state) => {     
    return {        
        auth: state.auth
    };
};

export default connect(mapStateToProps, {})(SmartComponent);