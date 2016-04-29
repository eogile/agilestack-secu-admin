import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Table, TableHeader, TableBody, TableRow, TableHeaderColumn, TableRowColumn, TableFooter, FlatButton } from 'material-ui';

import { fetchPoliciesIfNeeded } from '../actions/PolicyActions';

class Policies extends Component {

    componentWillMount() {
        const { dispatch } = this.props;
        dispatch(fetchPoliciesIfNeeded());
    }

    onRowClick(policy) {
        const { onPolicyClick } = this.props;
        console.log('Policy row clicked', policy, onPolicyClick);
        if (onPolicyClick) {
            onPolicyClick(policy);
        }
    }

    onTableCellClick(row, col) {
        // Workaround for https://github.com/callemall/material-ui/issues/1783
        console.log('Policy table cell clicked', row, col);
        this.onRowClick(this.props.policies.data[row]);
    }

    onCreate() {
        const { onPolicyClick } = this.props;
        console.log('onCreate');
        if (onPolicyClick) {
            onPolicyClick(null);
        }
    }

    render() {
        const { policies } = this.props;

        return (
            <Table onCellClick={this.onTableCellClick.bind(this)}>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                    <TableRow>
                        <TableHeaderColumn style={{textAlign: 'center'}}>
                            Policies
                        </TableHeaderColumn>
                    </TableRow>
                    <TableRow>
                        <TableHeaderColumn>Description</TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false} showRowHover={true}>
                    {policies.error ?
                        <TableRow><TableRowColumn colSpan="3">Error: { policies.error.message }</TableRowColumn></TableRow> :
                        policies.data.map(policy => (
                            <TableRow key={policy.id} onRowClick={this.onRowClick.bind(this, policy)}>
                                <TableRowColumn>
                                    <div>{ policy.description }</div>
                                </TableRowColumn>
                            </TableRow>
                        ), this)
                    }
                    {policies.loading ? <TableRow><TableRowColumn>Loading policies...</TableRowColumn></TableRow> : null}
                </TableBody>
                <TableFooter adjustForCheckbox={false}>
                    <TableRow>
                        <TableRowColumn>
                            <FlatButton
                                label="Create a new policy"
                                secondary={true}
                                onTouchTap={this.onCreate.bind(this)}
                                />
                        </TableRowColumn>
                    </TableRow>
                </TableFooter>
            </Table>
        );
    }

}

Policies.propTypes = {
    onPolicyClick: PropTypes.func,
};

export default connect(state => ({
    policies: state.policies,
}))(Policies);
