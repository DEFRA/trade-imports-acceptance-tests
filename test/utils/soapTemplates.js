export const clearanceRequestTemplate = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
    xmlns:oas="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
    <soap:Header>
        <oas:Security soap:role="system" soap:mustUnderstand="true">
            <oas:UsernameToken>
                {{#if username}}<oas:Username>{{username}}</oas:Username>{{/if}}
                {{#if passwordType}}<oas:Password Type="{{passwordType}}">{{password}}</oas:Password>{{/if}}
            </oas:UsernameToken>
        </oas:Security>
    </soap:Header>
    <soap:Body>
        <ALVSClearanceRequest xmlns="http://submitimportdocumenthmrcfacade.types.esb.ws.cara.defra.com">
            <ServiceHeader>
                {{#if SourceSystem}}<SourceSystem>{{SourceSystem}}</SourceSystem>{{/if}}
                {{#if DestinationSystem}}<DestinationSystem>{{DestinationSystem}}</DestinationSystem>{{/if}}
                {{#if CorrelationId}}<CorrelationId>{{CorrelationId}}</CorrelationId>{{/if}}
                {{#if timeStamp}}<ServiceCallTimestamp>{{timeStamp}}</ServiceCallTimestamp>{{/if}}
            </ServiceHeader>
            <Header>
                {{#if mrn}}<EntryReference>{{mrn}}</EntryReference>{{/if}}
                {{#if EntryVersionNumber}}<EntryVersionNumber>{{EntryVersionNumber}}</EntryVersionNumber>{{/if}}
                {{#if PreviousVersionNumber}}<PreviousVersionNumber>{{PreviousVersionNumber}}</PreviousVersionNumber>{{/if}}
                {{#if DeclarationUCR}}<DeclarationUCR>{{DeclarationUCR}}</DeclarationUCR>{{/if}}
                {{#if DeclarationType}}<DeclarationType>{{DeclarationType}}</DeclarationType>{{/if}}
                {{#if ArrivalDateTime}}<ArrivalDateTime>{{ArrivalDateTime}}</ArrivalDateTime>{{/if}}
                {{#if SubmitterTURN}}<SubmitterTURN>{{SubmitterTURN}}</SubmitterTURN>{{/if}}
                {{#if DeclarantId}}<DeclarantId>{{DeclarantId}}</DeclarantId>{{/if}}
                {{#if DeclarantName}}<DeclarantName>{{DeclarantName}}</DeclarantName>{{/if}}
                {{#if DispatchCountryCode}}<DispatchCountryCode>{{DispatchCountryCode}}</DispatchCountryCode>{{/if}}
                {{#if GoodsLocationCode}}<GoodsLocationCode>{{GoodsLocationCode}}</GoodsLocationCode>{{/if}}
                {{#if MasterUCR}}<MasterUCR>{{MasterUCR}}</MasterUCR>{{/if}}
            </Header>
            {{#each items}}
            <Item>
                {{#if ItemNumber}}<ItemNumber>{{ItemNumber}}</ItemNumber>{{/if}}
                {{#if CustomsProcedureCode}}<CustomsProcedureCode>{{CustomsProcedureCode}}</CustomsProcedureCode>{{/if}}
                {{#if TaricCommodityCode}}<TaricCommodityCode>{{TaricCommodityCode}}</TaricCommodityCode>{{/if}}
                {{#if GoodsDescription}}<GoodsDescription>{{GoodsDescription}}</GoodsDescription>{{/if}}
                {{#if ConsigneeId}}<ConsigneeId>{{ConsigneeId}}</ConsigneeId>{{/if}}
                {{#if ConsigneeName}}<ConsigneeName>{{ConsigneeName}}</ConsigneeName>{{/if}}
                {{#if ItemNetMass}}<ItemNetMass>{{ItemNetMass}}</ItemNetMass>{{/if}}
                {{#if ItemOriginCountryCode}}<ItemOriginCountryCode>{{ItemOriginCountryCode}}</ItemOriginCountryCode>{{/if}}

                {{#each Documents}}
                <Document>
                    {{#if DocumentCode}}<DocumentCode>{{DocumentCode}}</DocumentCode>{{/if}}
                    {{#if DocumentReference}}<DocumentReference>{{DocumentReference}}</DocumentReference>{{/if}}
                    {{#if DocumentStatus}}<DocumentStatus>{{DocumentStatus}}</DocumentStatus>{{/if}}
                    {{#if DocumentControl}}<DocumentControl>{{DocumentControl}}</DocumentControl>{{/if}}
                    {{#if DocumentQuantity}}<DocumentQuantity>{{DocumentQuantity}}</DocumentQuantity>{{/if}}
                </Document>
                {{/each}}

                {{#each Checks}}
                <Check>
                    {{#if CheckCode}}<CheckCode>{{CheckCode}}</CheckCode>{{/if}}
                    {{#if DepartmentCode}}<DepartmentCode>{{DepartmentCode}}</DepartmentCode>{{/if}}
                </Check>
                {{/each}}
            </Item>
            {{/each}}
        </ALVSClearanceRequest>
    </soap:Body>
</soap:Envelope>`

export const finalisationNotificationTemplate = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
    xmlns:oas="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
    <soap:Header>
        <oas:Security soap:role="system" soap:mustUnderstand="true">
            <oas:UsernameToken>
                {{#if username}}<oas:Username>{{username}}</oas:Username>{{/if}}
                {{#if passwordType}}<oas:Password Type="{{passwordType}}">{{password}}</oas:Password>{{/if}}
            </oas:UsernameToken>
        </oas:Security>
    </soap:Header>
    <soap:Body>
        <FinalisationNotificationRequest xmlns="http://notifyfinalisedstatehmrcfacade.types.esb.ws.cara.defra.com">
            <ServiceHeader>
                {{#if SourceSystem}}<SourceSystem>{{SourceSystem}}</SourceSystem>{{/if}}
                {{#if DestinationSystem}}<DestinationSystem>{{DestinationSystem}}</DestinationSystem>{{/if}}
                {{#if CorrelationId}}<CorrelationId>{{CorrelationId}}</CorrelationId>{{/if}}
                {{#if timeStamp}}<ServiceCallTimestamp>{{timeStamp}}</ServiceCallTimestamp>{{/if}}
            </ServiceHeader>
            <Header>
                {{#if EntryReference}}<EntryReference>{{EntryReference}}</EntryReference>{{/if}}
                {{#if EntryVersionNumber}}<EntryVersionNumber>{{EntryVersionNumber}}</EntryVersionNumber>{{/if}}
                {{#if DecisionNumber}}<DecisionNumber>{{DecisionNumber}}</DecisionNumber>{{/if}}
                {{#if FinalState}}<FinalState>{{FinalState}}</FinalState>{{/if}}
                {{#if ManualAction}}<ManualAction>{{ManualAction}}</ManualAction>{{/if}}
            </Header>
        </FinalisationNotificationRequest>
    </soap:Body>
</soap:Envelope>`

export const errorNotificationTemplate = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
    xmlns:oas="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
    <soap:Header>
        <oas:Security soap:role="system" soap:mustUnderstand="true">
            <oas:UsernameToken>
                {{#if username}}<oas:Username>{{username}}</oas:Username>{{/if}}
                {{#if passwordType}}<oas:Password Type="{{passwordType}}">{{password}}</oas:Password>{{/if}}
            </oas:UsernameToken>
        </oas:Security>
    </soap:Header>
    <soap:Body>
        <ALVSErrorNotificationRequest xmlns="http://alvserrornotification.types.esb.ws.cara.defra.com">
            <ServiceHeader>
                {{#if SourceSystem}}<SourceSystem>{{SourceSystem}}</SourceSystem>{{/if}}
                {{#if DestinationSystem}}<DestinationSystem>{{DestinationSystem}}</DestinationSystem>{{/if}}
                {{#if CorrelationId}}<CorrelationId>{{CorrelationId}}</CorrelationId>{{/if}}
                {{#if timeStamp}}<ServiceCallTimestamp>{{timeStamp}}</ServiceCallTimestamp>{{/if}}
            </ServiceHeader>
            <Header>
                {{#if SourceCorrelationId}}<SourceCorrelationId>{{SourceCorrelationId}}</SourceCorrelationId>{{/if}}
                {{#if EntryReference}}<EntryReference>{{EntryReference}}</EntryReference>{{/if}}
                {{#if EntryVersionNumber}}<EntryVersionNumber>{{EntryVersionNumber}}</EntryVersionNumber>{{/if}}
            </Header>
            <Error>
                {{#if ErrorCode}}<ErrorCode>{{ErrorCode}}</ErrorCode>{{/if}}
                {{#if ErrorMessage}}<ErrorMessage>{{ErrorMessage}}</ErrorMessage>{{/if}}
            </Error>
        </ALVSErrorNotificationRequest>
    </soap:Body>
</soap:Envelope>`
