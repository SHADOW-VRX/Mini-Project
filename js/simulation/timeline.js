/**
 * PORTFOLIO CRASH THEATRE — SIMULATION TIMELINE CONTROLLER
 * Manages simulation clock, playback controls, tick loops, and milestone news feed triggers.
 */

export class SimulationTimeline {
  constructor(engine, onTickCallback, onMilestoneCallback, onCompleteCallback) {
    this.engine = engine;
    this.onTick = onTickCallback;
    this.onMilestone = onMilestoneCallback;
    this.onComplete = onCompleteCallback;

    this.currentDay = 0;
    this.totalDays = engine.duration;
    this.isPlaying = false;
    this.speed = 1.0; // 1x default
    this.timerId = null;

    this.emittedMilestones = new Set();
  }

  /**
   * Set playback speed
   */
  setSpeed(speedVal) {
    if (speedVal === 'instant') {
      this.speed = 'instant';
    } else {
      this.speed = parseFloat(speedVal) || 1.0;
    }

    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }

  /**
   * Start or resume simulation playback
   */
  play() {
    if (this.currentDay >= this.totalDays) {
      this.currentDay = 0;
      this.emittedMilestones.clear();
    }

    this.isPlaying = true;

    if (this.speed === 'instant') {
      // Jump directly to end
      this.seek(this.totalDays);
      this.pause();
      if (this.onComplete) this.onComplete(this.engine.trajectory);
      return;
    }

    // Interval time: base 400ms per day at 1x
    const intervalMs = Math.max(50, Math.round(400 / this.speed));

    this.timerId = setInterval(() => {
      if (this.currentDay < this.totalDays) {
        this.currentDay++;
        this._dispatchDayUpdate();
      } else {
        this.pause();
        if (this.onComplete) this.onComplete(this.engine.trajectory);
      }
    }, intervalMs);

    this._dispatchDayUpdate();
  }

  /**
   * Pause playback
   */
  pause() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Step forward by 1 day
   */
  stepForward() {
    this.pause();
    if (this.currentDay < this.totalDays) {
      this.currentDay++;
      this._dispatchDayUpdate();
    }
  }

  /**
   * Step backward by 1 day
   */
  stepBackward() {
    this.pause();
    if (this.currentDay > 0) {
      this.currentDay--;
      this._dispatchDayUpdate();
    }
  }

  /**
   * Seek directly to a specific day step
   */
  seek(day) {
    this.currentDay = Math.min(Math.max(parseInt(day, 10) || 0, 0), this.totalDays);
    this._dispatchDayUpdate();
  }

  /**
   * Reset simulation back to day 0
   */
  restart() {
    this.pause();
    this.currentDay = 0;
    this.emittedMilestones.clear();
    this._dispatchDayUpdate();
  }

  /**
   * Internal dispatcher for tick updates
   */
  _dispatchDayUpdate() {
    const stepData = this.engine.getStep(this.currentDay);

    // Check for milestone news at this day
    const milestones = this.engine.scenario.milestones || [];
    for (const m of milestones) {
      if (m.day === this.currentDay && !this.emittedMilestones.has(m.day)) {
        this.emittedMilestones.add(m.day);
        if (this.onMilestone) {
          this.onMilestone(m, this.currentDay);
        }
      }
    }

    if (this.onTick) {
      this.onTick(stepData, this.currentDay, this.totalDays);
    }
  }

  /**
   * Cleanup timer on unmount
   */
  destroy() {
    this.pause();
  }
}
