export class BusinessTourCreatedEvent {
  constructor(
    public readonly businessTourId: string,
    public readonly businessProfileId: string,
  ) {}
}

export class BusinessTourPublishedEvent {
  constructor(
    public readonly businessTourId: string,
    public readonly businessProfileId: string,
  ) {}
}
