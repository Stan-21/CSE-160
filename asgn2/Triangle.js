class Triangle {
    constructor() {
        this.type = 'triangle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.points = [];
        this.state = 0;
    }

    render() {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;
    
        // Pass the position of a point to a_Position variable
        gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // Pass the size of a point to u_Size variable
        gl.uniform1f(u_Size, size)
        // Draw
        if (this.points.length == 0) {
            var d = this.size / 200.0; // maybe could move stuff above to if statements?
            drawTriangle([xy[0], xy[1], xy[0]+d, xy[1], xy[0], xy[1]+d]);
        } else {
            drawTriangle([this.points[0] / this.size, this.points[1] / this.size - 0.1, this.points[2] / this.size,
                this.points[3] / this.size - 0.1, this.points[4] / this.size, this.points[5] / this.size - 0.1]
            );
        }
    }

    cycleColors() {
        var interval = (1.0 / 255) * 20;
        if (this.state == 0) {
          this.color[1] += interval;
          if (this.color[1] >= 1.0) {
            this.color[1] = 1.0;
            this.state = 1;
          }
        }
        if (this.state == 1) {
          this.color[0] -= interval;
          if (this.color[0] <= 0) {
            this.color[0] = 0;
            this.state = 2;
          }
        }
        if (this.state == 2) {
          this.color[2] += interval;
          if (this.color[2] >= 1.0) {
            this.color[2] = 1.0;
            this.state = 3;
          }
        }
        if (this.state == 3) {
          this.color[1] -= interval;
          if (this.color[1] <= 0) {
            this.color[1] = 0.0;
            this.state = 4;
          }
        }
        if (this.state == 4) {
          this.color[0] += interval;
          if (this.color[0] >= 1.0) {
            this.color[0] = 1.0;
            this.state = 5;
          }
        }
        if (this.state == 5) {
          this.color[2] -= interval;
          if (this.color[2] <= 0) {
            this.color[2] = 0.0;
            this.state = 0;
          }
        }
      }
}

function drawTriangle(vertices) {
    // var vertices = new Float32Array([
    //    0, 0.5, -0.5, -0.5, 0.5, -0.5
    //]);

    var n = 3;

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log("Failed to create the buffer object");
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    //var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    //if (a_Position < 0) {
    //   console.log('Failed to get the storage location of a_Position');
    //    return -1;
    //}

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3D(vertices) {
  var n = 3;

  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
      console.log("Failed to create the buffer object");
      return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  //var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  //if (a_Position < 0) {
  //   console.log('Failed to get the storage location of a_Position');
  //    return -1;
  //}

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.drawArrays(gl.TRIANGLES, 0, n);
}